<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomReportExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected Collection $rows,
        protected array $columns,
        protected array $availableColumns,
    ) {}

    public function collection(): Collection
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return array_map(fn ($key) => $this->availableColumns[$key]['heading'], $this->columns);
    }

    public function map($row): array
    {
        return array_map(fn ($key) => data_get($row, $key, '—'), $this->columns);
    }
}
