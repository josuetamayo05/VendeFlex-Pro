import * as XLSX from 'xlsx';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import type { ProductItem, Investment, Sale, Client, PaymentMethod } from '@/types';

type ExcelRow = Record<string, string | number | boolean | undefined>;

export const importFromGymShopExcel = async (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });

        let investmentId = 1;

        // 1. LEER RESUMEN DE LA PESTAÑA 'SUMMARY' O 'RESUMEN' O 'PEDIDOS'
        const summarySheetName = workbook.SheetNames.find((name) =>
          ['SUMMARY', 'RESUMEN', 'PEDIDOS'].includes(name.toUpperCase().trim())
        );

        if (summarySheetName) {
          const sheet = workbook.Sheets[summarySheetName];
          const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

          let productsCost = 361.94;
          let shippingCost = 113.05;
          let totalInvestment = 474.99;

          // Extraer valores clave de la pestaña SUMMARY
          rawRows.forEach((row) => {
            if (Array.isArray(row) && row.length >= 2) {
              const key = String(row[0] || '').trim().toLowerCase();
              const val = Number(row[1]) || 0;

              if (key.includes('compra shein') || key.includes('total compra')) productsCost = val;
              if (key.includes('factura total agencia') || key.includes('envio')) shippingCost = val;
              if (key.includes('inversión total') || key.includes('inversion total')) totalInvestment = val;
            }
          });

          const investment: Investment = {
            id: 1,
            code: 'P001',
            name: 'Importación SHEIN / TEMU',
            type: 'import_usa',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            supplierName: 'SHEIN/TEMU',
            productsCost,
            weightLbs: 23,
            shippingRatePerLb: 4.9,
            shippingCost,
            taxes: 0,
            totalInvestment: totalInvestment || productsCost + shippingCost,
            currency: 'USD',
            color: '#3B82F6',
          };

          useInvestmentsStore.setState({ investments: [investment] });
          investmentId = investment.id;
        }

        // 2. LEER INVENTARIO EXACTO DE TU EXCEL
        const invSheetName = workbook.SheetNames.find((name) =>
          name.toUpperCase().trim().includes('INVENTARIO')
        );

        if (invSheetName) {
          const sheet = workbook.Sheets[invSheetName];
          const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

          const products: ProductItem[] = data
            .filter((row) => row['Producto'] || row['Name'])
            .map((row, idx) => {
              const name = String(row['Producto'] || row['Name']);
              const category = String(row['Tipo'] || row['Categoría'] || 'General');

              // Precio: Busca 'Precio Venta Final', luego 'Precio Venta Sugerido', luego 'Precio venta real'
              const price =
                Number(row['Precio Venta Final'] ?? row['Precio Venta Sugerido'] ?? row['Precio venta real']) || 10;

              // Costo unitario real
              const cost = Number(row['Costo unitario real'] ?? row['Precio unitario SHEIN']) || 5;

              // Stock disponible: lee 'Disponible' o 'Disponibles'
              const rawAvailable = row['Disponible'] ?? row['Disponibles'];
              let stock = rawAvailable !== undefined && rawAvailable !== '' ? Number(rawAvailable) : 0;

              if (isNaN(stock)) {
                const qty = Number(row['Cantidad']) || 0;
                const sold = Number(row['Vendidos']) || 0;
                stock = Math.max(0, qty - sold);
              }

              return {
                id: idx + 1,
                investmentId,
                name,
                category,
                origin: 'USA',
                price,
                currency: 'USD',
                stock: Math.max(0, stock),
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
                cost,
              };
            });

          if (products.length > 0) {
            useProductsStore.setState({ products });
          }
        }

        // 3. LEER VENTAS EXACTAS DE TU EXCEL
        const salesSheetName = workbook.SheetNames.find((name) =>
          name.toUpperCase().trim().includes('VENTAS')
        );

        if (salesSheetName) {
          const sheet = workbook.Sheets[salesSheetName];
          const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

          const currentProducts = useProductsStore.getState().products;
          const clientsList: Client[] = [];

          const sales: Sale[] = data
            .filter((row) => row['Producto'])
            .map((row, idx) => {
              const productName = String(row['Producto']);
              const product = currentProducts.find(
                (p) => p.name.toLowerCase().trim() === productName.toLowerCase().trim()
              );

              const qty = Number(row['Cantidad']) || 1;

              // Precio al que se vendió: busca 'Precio venta real', si no 'Precio actual (referencia)'
              const unitPrice =
                Number(row['Precio venta real'] ?? row['Precio actual (referencia)'] ?? row['Precio actual']) ||
                (product ? product.price : 10);

              const unitCost = product?.cost ? product.cost : 5;
              const totalUSD = Number(row['Ingreso total']) || qty * unitPrice;
              const profitUSD = Number(row['Ganancia real']) || (unitPrice - unitCost) * qty;

              const paymentMethodStr = String(row['Forma de pago'] || 'Efectivo USD');
              const clientNameRaw = row['Clientes'] ? String(row['Clientes']).trim() : undefined;

              // Si hay un cliente nuevo, agregarlo a la lista
              if (clientNameRaw && !clientsList.some((c) => c.name.toLowerCase() === clientNameRaw.toLowerCase())) {
                const phoneMatch = clientNameRaw.match(/(5\d{7})/);
                clientsList.push({
                  id: clientsList.length + 1,
                  name: clientNameRaw,
                  phone: phoneMatch ? `53${phoneMatch[1]}` : undefined,
                  tags: ['Importado Excel'],
                  debts: [],
                  totalSpentUSD: totalUSD,
                });
              }

              return {
                id: idx + 1,
                date: String(row['Fecha'] || new Date().toISOString().split('T')[0]),
                paymentMethod: paymentMethodStr as PaymentMethod,
                clientName: clientNameRaw,
                totalUSD,
                totalProfitUSD: profitUSD,
                isFiado: paymentMethodStr.toLowerCase().includes('fiado'),
                items: [
                  {
                    productId: product ? product.id : 1,
                    productName,
                    investmentId: product ? product.investmentId : investmentId,
                    quantity: qty,
                    unitPriceUSD: unitPrice,
                    unitCostUSD: unitCost,
                    totalUSD,
                    profitUSD,
                  },
                ],
              };
            });

          if (sales.length > 0) {
            useSalesStore.setState({ sales });
          }

          if (clientsList.length > 0) {
            useClientsStore.setState({ clients: clientsList });
          }
        }

        resolve({ success: true, message: '¡Excel importado perfectamente con tus datos reales!' });
      } catch (err) {
        console.error('Error al procesar el Excel:', err);
        resolve({ success: false, message: 'Error al leer la estructura de tu Excel' });
      }
    };

    reader.onerror = () => resolve({ success: false, message: 'Error al abrir el archivo' });
    reader.readAsArrayBuffer(file);
  });
};