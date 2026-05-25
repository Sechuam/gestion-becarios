import { Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type ExportReportModalProps = {
    intern: any;
    isOpen: boolean;
    onClose: () => void;
};

function ExportReportModal({
    intern,
    isOpen,
    onClose,
}: ExportReportModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const setPeriod = (type: 'month' | 'year' | 'full') => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (type === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        } else if (type === 'full') {
            start = new Date(intern.start_date);
            end = intern.end_date ? new Date(intern.end_date) : new Date();
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleDownload = () => {
        if (!startDate || !endDate) return;
        window.open(
            `/interns/${intern.id}/report?start_date=${startDate}&end_date=${endDate}`,
            '_blank',
        );
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden border-sidebar/20 bg-slate-50 p-0 shadow-xl sm:max-w-md dark:bg-slate-900">
                <div className="bg-gradient-to-r from-sidebar to-sidebar-accent px-6 py-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Download className="h-5 w-5 text-white/80" />
                            Exportar Reporte de Asistencia
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-6 px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPeriod('month')}
                            className="rounded-xl border-sidebar/10 bg-white text-xs font-bold text-sidebar shadow-sm transition-all hover:bg-sidebar/5"
                        >
                            Este Mes
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPeriod('year')}
                            className="rounded-xl border-sidebar/10 bg-white text-xs font-bold text-sidebar shadow-sm transition-all hover:bg-sidebar/5"
                        >
                            Este Año
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPeriod('full')}
                            className="rounded-xl border-sidebar/10 bg-white text-xs font-bold text-sidebar shadow-sm transition-all hover:bg-sidebar/5"
                        >
                            Todo el Periodo
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[sidebar-accent/70 ml-1 text-[10px] font-black tracking-widest uppercase">
                                Fecha Inicio
                            </Label>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[sidebar-accent/70 ml-1 text-[10px] font-black tracking-widest uppercase">
                                Fecha Fin
                            </Label>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                className="rounded-xl border-sidebar/10 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3 border-t border-sidebar/10 px-6 py-4 sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-100"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={!startDate || !endDate}
                        className="h-10 rounded-xl bg-gradient-to-r from-sidebar to-sidebar-accent px-6 font-black text-white shadow-lg shadow-sidebar/20 transition-all hover:opacity-95"
                    >
                        Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { ExportReportModal };
export default ExportReportModal;
