<?php

namespace App\Exports;

use App\Models\EducationCenter;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EducationCentersExport implements FromQuery, WithHeadings, WithMapping
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
        $query = EducationCenter::query();

        $trashed = $this->filters['trashed'] ?? null;
        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        }

        if (! empty($this->filters['search'])) {
            $query->where('name', 'ilike', '%'.$this->filters['search'].'%');
        }

        $order = $this->filters['order'] ?? 'az';
        if ($order === 'za') {
            $query->orderBy('name', 'desc');
        } elseif ($order === 'recent') {
            $query->orderBy('updated_at', 'desc');
        } elseif ($order === 'oldest') {
            $query->orderBy('updated_at', 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        return $query;
    }

    public function headings(): array
    {
        return array_map(function ($key) {
            return $this->availableColumns()[$key]['heading'];
        }, $this->columns);
    }

    public function map($center): array
    {
        $values = [];
        $columns = $this->availableColumns();

        foreach ($this->columns as $key) {
            $values[] = $columns[$key]['value']($center);
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
                'value' => fn ($center) => $center->id,
            ],
            'name' => [
                'heading' => 'Nombre',
                'value' => fn ($center) => $center->name ?? '—',
            ],
            'code' => [
                'heading' => 'Código',
                'value' => fn ($center) => $center->code ?? '—',
            ],
            'city' => [
                'heading' => 'Ciudad',
                'value' => fn ($center) => $center->city ?? '—',
            ],
            'address' => [
                'heading' => 'Dirección',
                'value' => fn ($center) => $center->address ?? '—',
            ],
            'contact_person' => [
                'heading' => 'Contacto',
                'value' => fn ($center) => $center->contact_person ?? '—',
            ],
            'contact_position' => [
                'heading' => 'Cargo contacto',
                'value' => fn ($center) => $center->contact_position ?? '—',
            ],
            'contact_email' => [
                'heading' => 'Email del coordinador',
                'value' => fn ($center) => $center->contact_email ?? '—',
            ],
            'email' => [
                'heading' => 'Email institucional',
                'value' => fn ($center) => $center->email ?? '—',
            ],
            'phone' => [
                'heading' => 'Teléfono',
                'value' => fn ($center) => $center->phone ?? '—',
            ],
            'web' => [
                'heading' => 'Web',
                'value' => fn ($center) => $center->web ?? '—',
            ],
            'agreement_signed_at' => [
                'heading' => 'Fecha firma convenio',
                'value' => fn ($center) => $center->agreement_signed_at ?? '—',
            ],
            'agreement_expires_at' => [
                'heading' => 'Vencimiento convenio',
                'value' => fn ($center) => $center->agreement_expires_at ?? '—',
            ],
            'agreement_slots' => [
                'heading' => 'Plazas acordadas',
                'value' => fn ($center) => $center->agreement_slots ?? '—',
            ],
            'internal_notes' => [
                'heading' => 'Notas internas',
                'value' => fn ($center) => $center->internal_notes ?? '—',
            ],
            'created_at' => [
                'heading' => 'Fecha de registro',
                'value' => fn ($center) => $center->created_at?->format('d/m/Y') ?? '—',
            ],
            'updated_at' => [
                'heading' => 'Última actualización',
                'value' => fn ($center) => $center->updated_at?->format('d/m/Y H:i') ?? '—',
            ],
        ];
    }
}
