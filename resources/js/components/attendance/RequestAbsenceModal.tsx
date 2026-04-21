import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RequestAbsenceModal() {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        reason: 'Examen',
        justification_file: null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/absences', {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                reset();
                // Opcional: mostrar un aviso de éxito usando alguna librería de Toast si tienes
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 mx-4">
                    📅 Registrar Ausencia / Día libre
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Solicitar permiso de ausencia</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>¿Qué día vas a faltar?</Label>
                        <Input
                            type="date"
                            className="border-border bg-card text-foreground"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            required
                        />
                        {errors.date && <span className="text-xs text-red-500">{errors.date}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo de la ausencia</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                        >
                            <option value="Examen">Examen de la Universidad</option>
                            <option value="Enfermedad">Enfermedad / Cita Médica</option>
                            <option value="Asuntos Propios">Asuntos Personales</option>
                            <option value="Vacaciones">Vacaciones</option>
                        </select>
                        {errors.reason && <span className="text-xs text-red-500">{errors.reason}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label>Justificante (opcional)</Label>
                        <Input
                            type="file"
                            className="border-border bg-card text-foreground"
                            onChange={(e) => setData('justification_file', e.target.files?.[0] || null)}
                        />
                        <p className="text-[10px] text-muted-foreground italic">PDF, JPG, PNG (Max 5MB)</p>
                        {errors.justification_file && <span className="text-xs text-red-500">{errors.justification_file}</span>}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-amber-500 hover:bg-amber-600">Enviar Petición</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
