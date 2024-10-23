<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @property string $responsible_name
 * @property string $status
 * @property string $start_time
 * @property string $end_time
 */
final class UpdateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'responsible_name' => ['sometimes', 'string', 'max:255'],
            'start_time' => ['sometimes', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'status' => ['sometimes', Rule::in(['cancelled'])],
        ];
    }
}
