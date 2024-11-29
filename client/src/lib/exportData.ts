import { type Customer, type Opportunity } from "@db/schema";

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Handle arrays, objects, and null values
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

export function prepareAnalyticsData(customers: Customer[], opportunities: Opportunity[]) {
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
    acc[territory].machineCount += customer.machineTypes?.length || 0;
    
    // Calculate revenue for this customer
    const customerRevenue = opportunities
      .filter(opp => opp.customerId === customer.id)
      .reduce((sum, opp) => sum + Number(opp.value), 0);
    
    acc[territory].totalRevenue += customerRevenue;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(territoryData);
}
