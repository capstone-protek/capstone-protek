import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your account preferences and settings
        </p>
      </div>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-2xl">User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Label htmlFor="dark-mode" className="mb-2 block">Dark Mode</Label>
                    <Switch id="dark-mode" />
                </div>
                <div className="mb-4">
                    <Label htmlFor="notifications" className="mb-2 block">Email Notifications</Label>
                    <Switch id="notifications" />
                </div>
            </CardContent>
            <CardFooter>
                <Button>Save Changes</Button>
            </CardFooter>
        </Card>

        <Separator className="my-6" />

        <Card>
            <CardHeader>
                <CardTitle className="text-2x1">System Preferences</CardTitle>
            </CardHeader>
            <CardContent>
                <div className=""></div>
                <div className=""></div>
            </CardContent>
        </Card>
    </AppLayout>
  );
}