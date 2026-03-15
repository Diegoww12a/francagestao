import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { api } from '../../lib/api';

interface Note { id: string; content: string; created_at: string; updated_at: string; }

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => setNotes(await api.getNotes());

  const addNote = async () => {
    if (!newNote.trim()) return;
    await api.addNote({ content: newNote });
    setNewNote('');
    fetchNotes();
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;
    await api.updateNote(id, { content: editContent });
    setEditingId(null);
    setEditContent('');
    fetchNotes();
  };

  const deleteNote = async (id: string) => { await api.deleteNote(id); fetchNotes(); };
  const startEdit = (note: Note) => { setEditingId(note.id); setEditContent(note.content); };
  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-white">Anotações Rápidas</h2><p className="text-gray-400 mt-1">Mantenha suas ideias e lembretes organizados</p></div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nova Anotação</h3>
        <div className="space-y-3">
          <textarea placeholder="Digite sua anotação aqui..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none" />
          <button onClick={addNote} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"><Plus size={20} /> Adicionar Anotação</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div key={note.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-gray-500">{formatDate(note.updated_at)}</span>
              <div className="flex gap-2">
                {editingId !== note.id && (<><button onClick={() => startEdit(note)} className="text-gray-400 hover:text-blue-400 transition-colors"><Edit2 size={16} /></button><button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button></>)}
              </div>
            </div>
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 h-24 resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => updateNote(note.id)} className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"><Save size={14} /> Salvar</button>
                  <button onClick={() => setEditingId(null)} className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors">Cancelar</button>
                </div>
              </div>
            ) : (<p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{note.content}</p>)}
          </div>
        ))}
        {notes.length === 0 && <div className="col-span-3 text-center py-12"><p className="text-gray-500">Nenhuma anotação criada</p></div>}
      </div>
    </div>
  );
}
