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

// Remove analytics-related functions as they are now in exportData.ts