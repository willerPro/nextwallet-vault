
import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const Investors = () => {
  // Example investors data
  const [investors] = useState([
    { id: 1, name: "Alpha Capital", amount: "$250,000", status: "Active", date: "2025-01-15" },
    { id: 2, name: "Beta Ventures", amount: "$175,000", status: "Active", date: "2025-02-22" },
    { id: 3, name: "Gamma Investments", amount: "$320,000", status: "Pending", date: "2025-04-10" },
  ]);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">Investors</h1>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor) => (
                    <TableRow key={investor.id}>
                      <TableCell className="font-medium">{investor.name}</TableCell>
                      <TableCell>{investor.amount}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          investor.status === "Active" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {investor.status}
                        </span>
                      </TableCell>
                      <TableCell>{investor.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Investors;
