import React, { useState } from 'react';
import { Firestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { toast } from 'sonner';

interface NotificationCreatorProps {
  db: Firestore | null;
  auth: Auth | null;
}

export const NotificationCreator: React.FC<NotificationCreatorProps> = ({ db, auth }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleCreate = async () => {
    if (!db || !auth?.currentUser) return;

    try {
      await addDoc(collection(db, `teachers/${auth.currentUser.uid}/notifications`), {
        userId: auth.currentUser.uid,
        title,
        message,
        scheduledTime: Timestamp.fromDate(new Date(scheduledTime)),
        isRead: false,
        type: 'reminder'
      });
      toast.success('Notification scheduled!');
      setTitle('');
      setMessage('');
      setScheduledTime('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule notification');
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold mb-4">Create Notification</h3>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <input type="text" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <button onClick={handleCreate} className="w-full p-2 bg-blue-600 text-white rounded">Schedule</button>
    </div>
  );
};
