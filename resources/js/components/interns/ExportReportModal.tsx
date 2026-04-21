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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-indigo-500" />
                        Exportar Reporte de Asistencia
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-wrap gap-2 text-slate-900 dark:text-white">
                        <Button variant="outline" size="sm" onClick={() => setPeriod('month')}>Este Mes</Button>
                        <Button variant="outline" size="sm" onClick={() => setPeriod('year')}>Este Año</Button>
                        <Button variant="outline" size="sm" onClick={() => setPeriod('full')}>Todo el Periodo</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Fecha Inicio</Label>
                            <DatePicker value={startDate} onChange={setStartDate} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Fecha Fin</Label>
                            <DatePicker value={endDate} onChange={setEndDate} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="dark:text-slate-400">Cancelar</Button>
                    <Button
                        onClick={handleDownload}
                        disabled={!startDate || !endDate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
