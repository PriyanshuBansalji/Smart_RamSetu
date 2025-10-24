import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, CheckCircle, Clock, TrendingUp, FileCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Monitor and manage the RamSetu platform</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">523</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-secondary" />
                +12% this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-accent" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">187</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-secondary" />
                +8% this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                Successful Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">214</div>
              <p className="text-sm text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
              <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Documents awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Donor Verification */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Donor - Kidney (O+)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3 documents</Badge>
                  <Button size="sm">Review</Button>
                </div>
              </div>

              {/* Patient Verification */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Patient - Kidney (O+)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2 documents</Badge>
                  <Button size="sm">Review</Button>
                </div>
              </div>

              {/* More items */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Michael Brown</p>
                    <p className="text-sm text-muted-foreground">Donor - Liver (A+)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3 documents</Badge>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Pending ({28})
            </Button>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Successfully matched donors and patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/5">
                <div>
                  <p className="font-medium">Sarah Johnson → Robert Lee</p>
                  <p className="text-sm text-muted-foreground">Kidney (B+) - Matched 2 days ago</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/5">
                <div>
                  <p className="font-medium">David Wilson → Emily Davis</p>
                  <p className="text-sm text-muted-foreground">Liver (O+) - Matched 5 days ago</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FileCheck className="h-5 w-5" />
                <span>Verify Documents</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Heart className="h-5 w-5" />
                <span>View Matches</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Contact: labourzkart@gmail.com | 7505675163
export default AdminDashboard;
