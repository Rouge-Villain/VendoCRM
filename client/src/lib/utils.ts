import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Customer, type Opportunity } from "@/types/db";
interface BaseAnalyticsData {
  [key: string]: any;
}

interface AcquisitionData extends BaseAnalyticsData {
  period: string;
  newCustomers: number;
  totalMachines: number;
  revenue: number;
}

interface DistributionData extends BaseAnalyticsData {
  machineType: string;
  count: number;
  totalRevenue: number;
  customersUsing: number;
}

interface TerritoryData extends BaseAnalyticsData {
  territory: string;
  customerCount: number;
  machineCount: number;
  totalRevenue: number;
}

type AnalyticsData = AcquisitionData | DistributionData | TerritoryData;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
}

export function exportToCSV(data: any[], filename: string): void {
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
): AnalyticsData[] {
  switch (type) {
    case 'acquisition': {
      const acquisitionData: Record<string, any> = {};
      customers.forEach(customer => {
        if (customer.createdAt) {
          const date = new Date(customer.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!acquisitionData[monthYear]) {
            acquisitionData[monthYear] = {
              period: monthYear,
              newCustomers: 0,
              totalMachines: 0,
              revenue: 0,
            };
          }
          acquisitionData[monthYear].newCustomers++;
          const machineCount = Array.isArray(customer.machineTypes) ?
            customer.machineTypes.reduce((sum, machine: any) => 
              sum + (machine.quantity || 1), 0) : 0;
          acquisitionData[monthYear].totalMachines += machineCount;

          const customerRevenue = opportunities
            .filter(opp => opp.customerId === customer.id)
            .reduce((sum, opp) => sum + Number(opp.value), 0);
          acquisitionData[monthYear].revenue += customerRevenue;
        }
      });
      return Object.values(acquisitionData).sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
    }

    case 'distribution': {
      const machineDistribution: Record<string, any> = {};
      customers.forEach(customer => {
        if (Array.isArray(customer.machineTypes)) {
          customer.machineTypes.forEach((machine: any) => {
            const type = typeof machine === 'string' ? machine : machine.type;
            if (!machineDistribution[type]) {
              machineDistribution[type] = {
                machineType: type,
                count: 0,
                totalRevenue: 0,
                customersUsing: 0,
              };
            }
            machineDistribution[type].count++;
            machineDistribution[type].customersUsing++;
          });
        }
      });
      return Object.values(machineDistribution);
    }

    case 'territory': {
      const territoryData: Record<string, any> = {};
      customers.forEach(customer => {
        const territory = customer.serviceTerritory || 'Unassigned';
        if (!territoryData[territory]) {
          territoryData[territory] = {
            territory,
            customerCount: 0,
            machineCount: 0,
            totalRevenue: 0,
          };
        }
        
        territoryData[territory].customerCount++;
        territoryData[territory].machineCount += (Array.isArray(customer.machineTypes) ? 
          customer.machineTypes.length : 0);
        
        const customerRevenue = opportunities
          .filter(opp => opp.customerId === customer.id)
          .reduce((sum, opp) => sum + Number(opp.value), 0);
        
        territoryData[territory].totalRevenue += customerRevenue;
      });
      return Object.values(territoryData);
    }

    default: {
      throw new Error(`Unsupported analytics type: ${type}`);
    }
  }
}

export function exportAnalyticsData(
  customers: Customer[], 
  opportunities: Opportunity[],
  type: 'acquisition' | 'distribution' | 'territory'
): void {
  const data = prepareAnalyticsData(customers, opportunities, type);
  exportToCSV(data, `analytics_${type}_${new Date().toISOString().split('T')[0]}`);
}