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

    protected array $columns;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->columns = $this->resolveColumns($filters['columns'] ?? null);
    }

    public function query()
    {
        $query = Intern::with(['user', 'educationCenter']);

        $trashed = $this->filters['trashed'] ?? null;
        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        }

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
        if (! empty($this->filters['start_from'])) {
            $query->whereDate('start_date', '>=', $this->filters['start_from']);
        }
        if (! empty($this->filters['start_to'])) {
            $query->whereDate('start_date', '<=', $this->filters['start_to']);
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return array_map(function ($key) {
            return $this->availableColumns()[$key]['heading'];
        }, $this->columns);
    }

    public function map($intern): array
    {
        $values = [];
        $columns = $this->availableColumns();

        foreach ($this->columns as $key) {
            $values[] = $columns[$key]['value']($intern);
        }

        return $values;
    }

    protected function resolveColumns($raw): array
    {
        $available = array_keys($this->availableColumns());

        if (empty($raw)) {
            return $available;
        }

        if (is_string($raw)) {
            $raw = array_filter(array_map('trim', explode(',', $raw)));
        }

        if (! is_array($raw)) {
            return $available;
        }

        $columns = array_values(array_intersect($available, $raw));

        return count($columns) ? $columns : $available;
    }

    protected function availableColumns(): array
    {
        return [
            'id' => [
                'heading' => 'ID',
                'value' => fn ($intern) => $intern->id,
            ],
            'name' => [
                'heading' => 'Nombre',
                'value' => fn ($intern) => $intern->user->name ?? '—',
            ],
            'dni' => [
                'heading' => 'DNI / NIE',
                'value' => fn ($intern) => $intern->dni ?? '—',
            ],
            'email' => [
                'heading' => 'Email',
                'value' => fn ($intern) => $intern->user->email ?? '—',
            ],
            'phone' => [
                'heading' => 'Teléfono',
                'value' => fn ($intern) => $intern->phone ?? 'No indicado',
            ],
            'education_center' => [
                'heading' => 'Centro Educativo',
                'value' => fn ($intern) => $intern->educationCenter->name ?? 'Sin asignar',
            ],
            'academic_degree' => [
                'heading' => 'Titulación',
                'value' => fn ($intern) => $intern->academic_degree ?? '—',
            ],
            'total_hours' => [
                'heading' => 'Horas Totales',
                'value' => fn ($intern) => $intern->total_hours ?? '—',
            ],
            'start_date' => [
                'heading' => 'Fecha Inicio',
                'value' => fn ($intern) => $intern->start_date ?? '—',
            ],
            'end_date' => [
                'heading' => 'Fecha Fin',
                'value' => fn ($intern) => $intern->end_date ?? '—',
            ],
            'status' => [
                'heading' => 'Estado',
                'value' => fn ($intern) => strtoupper($intern->status ?? '—'),
            ],
            'created_at' => [
                'heading' => 'Fecha de Registro',
                'value' => fn ($intern) => $intern->created_at?->format('d/m/Y') ?? '—',
            ],
            'updated_at' => [
                'heading' => 'Última Actualización',
                'value' => fn ($intern) => $intern->updated_at?->format('d/m/Y H:i') ?? '—',
            ],
            'internal_notes' => [
                'heading' => 'Notas Internas',
                'value' => fn ($intern) => $intern->internal_notes ?? '—',
            ],
        ];
    }
}
