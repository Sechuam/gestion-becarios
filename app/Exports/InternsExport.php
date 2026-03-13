<?php

namespace App\Exports;

use App\Models\Intern;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InternsExport implements FromQuery, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Intern::with(['user', 'educationCenter']);
        if (! empty($this->filters['search'])) {
            $query->whereHas('user', function ($q) {
                $q->where(DB::raw('lower(name)'), 'like', '%'.strtolower($this->filters['search']).'%');
            });
        }
        if (! empty($this->filters['center'])) {
            $query->where('education_center_id', $this->filters['center']);
        }
        if (! empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'DNI / NIE',
            'Email',
            'Teléfono',
            'Centro Educativo',
            'Titulación',
            'Horas Totales',
            'Fecha Inicio',
            'Fecha Fin',
            'Estado',
            'Fecha de Registro',
        ];
    }

    public function map($intern): array
    {
        return [
            $intern->id,
            $intern->user->name,
            $intern->dni,
            $intern->user->email,
            $intern->phone ?? 'No indicado',
            $intern->educationCenter->name ?? 'Sin asignar',
            $intern->academic_degree,
            $intern->total_hours,
            $intern->start_date,
            $intern->end_date,
            strtoupper($intern->status),
            $intern->created_at->format('d/m/Y'),
        ];
    }
}
