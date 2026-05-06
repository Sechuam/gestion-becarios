import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

type ExportReportModalProps = {
    intern: any;
    isOpen: boolean;
    onClose: () => void;
};

function ExportReportModal({ intern, isOpen, onClose }: ExportReportModalProps) {
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
        window.open(`/interns/${intern.id}/report?start_date=${startDate}&end_date=${endDate}`, '_blank');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden border-sidebar/20 p-0 shadow-2xl sm:max-w-md bg-slate-50 dark:bg-slate-900">
                <div className="bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 py-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Download className="h-5 w-5 text-white/80" />
                            Exportar Reporte de Asistencia
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-6 px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPeriod('month')} className="bg-white border-sidebar/10 text-xs font-bold text-sidebar hover:bg-sidebar/5 transition-all shadow-sm rounded-xl">Este Mes</Button>
                        <Button variant="outline" size="sm" onClick={() => setPeriod('year')} className="bg-white border-sidebar/10 text-xs font-bold text-sidebar hover:bg-sidebar/5 transition-all shadow-sm rounded-xl">Este Año</Button>
                        <Button variant="outline" size="sm" onClick={() => setPeriod('full')} className="bg-white border-sidebar/10 text-xs font-bold text-sidebar hover:bg-sidebar/5 transition-all shadow-sm rounded-xl">Todo el Periodo</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]/70 ml-1">Fecha Inicio</Label>
                            <DatePicker 
                                value={startDate} 
                                onChange={setStartDate} 
                                className="bg-white border-sidebar/10 shadow-sm rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#1f4f52]/70 ml-1">Fecha Fin</Label>
                            <DatePicker 
                                value={endDate} 
                                onChange={setEndDate} 
                                className="bg-white border-sidebar/10 shadow-sm rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-sidebar/10 gap-3 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-100">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={!startDate || !endDate}
                        className="h-10 rounded-xl bg-gradient-to-r from-sidebar to-[#1f4f52] px-6 font-black text-white shadow-lg shadow-sidebar/20 transition-all hover:opacity-95"
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
