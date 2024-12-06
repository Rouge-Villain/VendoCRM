import { type Customer, type Opportunity } from "@db/schema";

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        if (Array.isArray(cell)) return `"${cell.join(';')}"`;
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'object') return `"${JSON.stringify(cell)}"`;
        if (typeof cell === 'string' && cell.includes(',')) return `"${cell}"`;
        return cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareAnalyticsData(
  customers: Customer[], 
  opportunities: Opportunity[], 
  type: 'acquisition' | 'distribution' | 'territory'
) {
  switch (type) {
    case 'acquisition': {
      const acquisitionData = customers.reduce((acc, customer) => {
        if (customer.createdAt) {
          const date = new Date(customer.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!acc[monthYear]) {
            acc[monthYear] = {
              period: monthYear,
              newCustomers: 0,
              totalMachines: 0,
              revenue: 0,
            };
          }
          acc[monthYear].newCustomers++;
          acc[monthYear].totalMachines += Array.isArray(customer.machineTypes) ? 
            customer.machineTypes.reduce((sum, machine: any) => sum + (machine.quantity || 1), 0) : 0;

          const customerRevenue = opportunities
            .filter(opp => opp.customerId === customer.id)
            .reduce((sum, opp) => sum + Number(opp.value), 0);
          acc[monthYear].revenue += customerRevenue;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(acquisitionData).sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
    }

    case 'distribution': {
      const machineDistribution = customers.reduce((acc, customer) => {
        if (Array.isArray(customer.machineTypes)) {
          customer.machineTypes.forEach((machine: any) => {
            const type = typeof machine === 'string' ? machine : machine.type;
            if (!acc[type]) {
              acc[type] = {
                machineType: type,
                count: 0,
                totalRevenue: 0,
                customersUsing: 0,
              };
            }
            acc[type].count++;
            acc[type].customersUsing++;
          });
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(machineDistribution);
    }

    case 'territory': {
      const territoryData = customers.reduce((acc, customer) => {
        const territory = customer.serviceTerritory || 'Unassigned';
        if (!acc[territory]) {
          acc[territory] = {
            territory,
            customerCount: 0,
            machineCount: 0,
            totalRevenue: 0,
          };
        }
        
        acc[territory].customerCount++;
        acc[territory].machineCount += (Array.isArray(customer.machineTypes) ? 
          customer.machineTypes.length : 0);
        
        const customerRevenue = opportunities
          .filter(opp => opp.customerId === customer.id)
          .reduce((sum, opp) => sum + Number(opp.value), 0);
        
        acc[territory].totalRevenue += customerRevenue;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(territoryData);
    }
  }
}

export function exportAnalyticsData(
  customers: Customer[], 
  opportunities: Opportunity[],
  type: 'acquisition' | 'distribution' | 'territory'
) {
  const data = prepareAnalyticsData(customers, opportunities, type);
  exportToCSV(data, `analytics_${type}_${new Date().toISOString().split('T')[0]}`);
}
