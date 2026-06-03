import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { getCroppedImg } from '@/lib/cropImage';

interface ImageCropperModalProps {
    image: string | null;
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedImage: Blob) => void;
}

export default function ImageCropperModal({
    image,
    open,
    onClose,
    onCropComplete,
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback(
        (croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        [],
    );

    const handleApply = async () => {
        if (!image || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!image) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[500px]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Recortar Foto de Perfil</DialogTitle>
                </DialogHeader>

                <div className="relative mt-4 h-[350px] w-full bg-slate-100 dark:bg-[#142235]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="space-y-4 p-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" />
                        <input
                            id="image-cropper-zoom"
                            name="image_cropper_zoom"
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary dark:bg-[#17283c]"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={isProcessing}
                            className="min-w-[100px] gap-2 rounded-xl"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Aplicar'
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
