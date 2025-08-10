<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Queue extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'age',
        'gender',
        'status',
        'patient_id',
        'consultation_id',
        'processed_by',
        'processed_at',
        'queue_number',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Generate next queue number
    public static function getNextQueueNumber(): int
    {
        $today = now()->startOfDay();
        $lastQueue = self::whereDate('created_at', $today)
            ->orderBy('queue_number', 'desc')
            ->first();

        return $lastQueue ? $lastQueue->queue_number + 1 : 1;
    }

    // Scope for today's queue
    public function scopeToday($query)
    {
        return $query->where('status', '!=', 'completed')->whereDate('created_at', now()->toDateString());
    }

    // Scope for waiting status
    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    // Scope for in progress status
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }
}
