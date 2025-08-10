<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QueueController extends Controller
{
    public function index(): Response
    {
        if (! Gate::allows('viewAny', Queue::class)) {
            abort(403, 'You do not have permission to view the queue.');
        }

        $todayQueue = Queue::today()
            ->with(['patient', 'consultation', 'processedBy'])
            ->orderBy('queue_number')
            ->get();
    
        $grouped = $todayQueue->groupBy('status');
    
        return Inertia::render('queue/index', [
            'queue' => $todayQueue->where('status', '!=', 'completed')->values(),
            'stats' => [
                'waiting' => $grouped->get('waiting', collect())->count(),
                'in_progress' => $grouped->get('in_progress', collect())->count(),
                'completed' => $grouped->get('completed', collect())->count(),
                'total' => $todayQueue->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('queue/create');
    }

    public function store(Request $request)
    {
        if (! Gate::allows('create', Queue::class)) {
            abort(403, 'You do not have permission to add to the queue.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:130',
            'gender' => 'required|in:male,female,other',
        ]);

        $queueNumber = Queue::getNextQueueNumber();

        $queue = Queue::create([
            'name' => $validated['name'],
            'age' => $validated['age'],
            'gender' => $validated['gender'],
            'status' => 'waiting',
            'queue_number' => $queueNumber,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Patient added to the queue successfully.');
    }

    public function process(Queue $queue)
    {
        if (! Gate::allows('process', $queue)) {
            abort(403, 'You do not have permission to process the queue.');
        }

        if ($queue->status !== 'waiting') {
            return redirect()->route('dashboard')
                ->with('error', 'This queue item cannot be processed.');
        }

        // Create patient record
        $patient = Patient::create([
            'name' => $queue->name,
            'age' => $queue->age,
            'gender' => $queue->gender,
        ]);

        // Create consultation
        $consultation = Consultation::create([
            'patient_id' => $patient->id,
            'doctor_id' => auth()->id(),
            'status' => 'draft',
        ]);

        // Update queue item
        $queue->update([
            'status' => 'in_progress',
            'patient_id' => $patient->id,
            'consultation_id' => $consultation->id,
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return redirect()->route('consultations.show', $consultation)
            ->with('success', 'Patient processed and consultation started.');
    }

    public function complete(Queue $queue)
    {
        if ($queue->status !== 'in_progress') {
            return redirect()->route('dashboard')
                ->with('error', 'This queue item cannot be completed.');
        }

        $queue->update([
            'status' => 'completed',
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Queue item marked as completed.');
    }

    public function cancel(Queue $queue)
    {
        if (! Gate::allows('cancel', $queue)) {
            abort(403, 'You do not have permission to delete the queue.');
        }

        if ($queue->status === 'completed') {
            return redirect()->route('dashboard')
                ->with('error', 'Cannot cancel a completed queue item.');
        }

        $queue->update([
            'status' => 'cancelled',
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Queue item cancelled.');
    }

    public function destroy(Queue $queue)
    {
        if (! Gate::allows('cancel', $queue)) {
            abort(403, 'You do not have permission to delete the queue.');
        }

        if ($queue->status === 'in_progress') {
            return back()->with('error', 'Cannot delete a queue that is in progress.');
        }

        $queue->delete();

        return back()->with('success', 'Queue has been deleted.');
    }
}
