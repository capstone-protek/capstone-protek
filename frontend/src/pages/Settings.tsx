import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { useTheme } from "@/context/theme";

export default function Settings() {
  // const { dark, setDark } = useTheme();

  // function handleSave() {
  //   // Kalau nanti ada preferensi lain, tinggal disimpan di sini
  //   console.log("saved");
  // }

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
        </CardContent>
        {/* <CardFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter> */}
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-2x1">System Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div></div>
          <div></div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
