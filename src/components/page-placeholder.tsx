import { Card, CardContent } from "@/components/ui/card";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Em construção — esta seção chega numa próxima fase.
        </CardContent>
      </Card>
    </div>
  );
}
