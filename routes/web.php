<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskChecklistItemController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskTimeEntryController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebsiteController;
use App\Http\Controllers\WebsiteCredentialController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/tasks/board', [TaskController::class, 'board'])->name('tasks.board');
    Route::get('/tasks/calendar', [TaskController::class, 'calendar'])->name('tasks.calendar');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status.update');
    Route::post('/tasks/{task}/reopen', [TaskController::class, 'reopen'])->name('tasks.reopen');

    Route::resource('websites', WebsiteController::class);
    Route::resource('tasks', TaskController::class);

    Route::post('/websites/{website}/credentials', [WebsiteCredentialController::class, 'store'])->name('websites.credentials.store');
    Route::put('/websites/{website}/credentials/{credential}', [WebsiteCredentialController::class, 'update'])->name('websites.credentials.update');
    Route::delete('/websites/{website}/credentials/{credential}', [WebsiteCredentialController::class, 'destroy'])->name('websites.credentials.destroy');
    Route::get('/websites/{website}/credentials/{credential}/reveal', [WebsiteCredentialController::class, 'reveal'])->name('websites.credentials.reveal');

    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::patch('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update'])->name('tasks.comments.update');
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('tasks.comments.destroy');

    Route::post('/tasks/{task}/checklist-items', [TaskChecklistItemController::class, 'store'])->name('tasks.checklist-items.store');
    Route::patch('/tasks/{task}/checklist-items/{checklistItem}', [TaskChecklistItemController::class, 'update'])->name('tasks.checklist-items.update');
    Route::delete('/tasks/{task}/checklist-items/{checklistItem}', [TaskChecklistItemController::class, 'destroy'])->name('tasks.checklist-items.destroy');

    Route::post('/tasks/{task}/time-entries', [TaskTimeEntryController::class, 'store'])->name('tasks.time-entries.store');
    Route::delete('/tasks/{task}/time-entries/{timeEntry}', [TaskTimeEntryController::class, 'destroy'])->name('tasks.time-entries.destroy');

    Route::get('/tasks/{task}/attachments/{attachment}/download', [TaskAttachmentController::class, 'download'])->name('tasks.attachments.download');
    Route::delete('/tasks/{task}/attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('tasks.attachments.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    Route::patch('/tour/complete', [TourController::class, 'complete'])->name('tour.complete');

    Route::resource('team', UserController::class)->except('show')->parameters(['team' => 'user']);

    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
