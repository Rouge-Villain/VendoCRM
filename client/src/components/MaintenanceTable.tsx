import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Maintenance } from "@db/schema";
import { format } from "date-fns";

interface MaintenanceTableProps {
  records: Maintenance[];
}

export function MaintenanceTable({ records }: MaintenanceTableProps) {
  return (
    <div className="rounded-lg border shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Completed Date</TableHead>
            <TableHead>Next Maintenance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.machineId}</TableCell>
              <TableCell className="capitalize">{record.maintenanceType}</TableCell>
              <TableCell>{record.description}</TableCell>
              <TableCell className="capitalize">{record.status}</TableCell>
              <TableCell>
                {record.scheduledDate
                  ? format(new Date(record.scheduledDate), "PPP")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {record.completedDate
                  ? format(new Date(record.completedDate), "PPP")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {record.nextMaintenanceDate
                  ? format(new Date(record.nextMaintenanceDate), "PPP")
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
