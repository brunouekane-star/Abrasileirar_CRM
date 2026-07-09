"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead } from "@/lib/actions/leads";
import type { Service } from "@/lib/types";

const formSchema = z.object({
  type: z.enum(["b2b", "b2c"]),
  contact_name: z.string().trim().min(1, "Informe o nome do contato."),
  company_name: z.string().trim().optional(),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  native_language: z.string().trim().optional(),
  service_id: z.string().optional(),
  estimated_value: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateLeadDialog({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: "b2c" },
  });

  const type = watch("type");

  async function onSubmit(values: FormValues) {
    const result = await createLead({
      type: values.type,
      contact_name: values.contact_name,
      company_name: values.company_name || null,
      email: values.email || "",
      phone: values.phone || null,
      nationality: values.nationality || null,
      native_language: values.native_language || null,
      service_id: values.service_id ? Number(values.service_id) : null,
      estimated_value: values.estimated_value
        ? Number(values.estimated_value)
        : null,
    });

    if (!result.ok) {
      toast.error("Erro ao criar lead", { description: result.error });
      return;
    }
    toast.success("Lead criado!");
    reset({ type: "b2c" });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Novo lead
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>
            Cadastre um contato no funil de vendas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                items={{ b2c: "B2C (Individual)", b2b: "B2B (Corporativo)" }}
                value={type}
                onValueChange={(v) => setValue("type", v as "b2b" | "b2c")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2c">B2C (Individual)</SelectItem>
                  <SelectItem value="b2b">B2B (Corporativo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Valor estimado (R$)</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                {...register("estimated_value")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Nome do contato *</Label>
            <Input id="contact_name" {...register("contact_name")} />
            {errors.contact_name ? (
              <p className="text-xs text-destructive">
                {errors.contact_name.message}
              </p>
            ) : null}
          </div>

          {type === "b2b" ? (
            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa</Label>
              <Input id="company_name" {...register("company_name")} />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input id="nationality" {...register("nationality")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="native_language">Idioma nativo</Label>
              <Input id="native_language" {...register("native_language")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Produto de interesse</Label>
            <Select
              items={Object.fromEntries(
                services.map((s) => [String(s.id), s.name]),
              )}
              onValueChange={(v) => setValue("service_id", v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um programa" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
