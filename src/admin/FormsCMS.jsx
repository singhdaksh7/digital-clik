import React, { useState, useEffect } from 'react';
import {
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm
} from '../api/admin';
import {
  Plus, Edit, Trash2, CheckCircle2, Copy, Check, Eye,
  ArrowUp, ArrowDown, HelpCircle, Layers, Send, AlertCircle
} from 'lucide-react';

export default function FormsCMS({ onSelectFormSubmissions }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState(null); // null = list, { ... } = editor
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Form Editor Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('Submit Request');
  const [successMessage, setSuccessMessage] = useState('Thank you! We will get back to you within 24 hours.');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [fields, setFields] = useState([]);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await getForms();
      if (res.success) {
        setForms(res.data);
      }
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setTitle('New Lead Form');
    setSlug(`form-${Date.now().toString(36)}`);
    setDescription('');
    setSubmitButtonText('Submit Request');
    setSuccessMessage('Thank you! We have received your inquiry.');
    setRedirectUrl('');
    setNotifyEmail('');
    setFields([
      { name: 'fullName', label: 'Full Name', type: 'TEXT', placeholder: 'John Doe', isRequired: true, sortOrder: 0 },
      { name: 'email', label: 'Work Email', type: 'EMAIL', placeholder: 'john@example.com', isRequired: true, sortOrder: 1 },
      { name: 'phone', label: 'Phone Number', type: 'PHONE', placeholder: '+91 98765 43210', isRequired: false, sortOrder: 2 },
      { name: 'message', label: 'Project Brief', type: 'TEXTAREA', placeholder: 'Tell us about your project...', isRequired: true, sortOrder: 3 }
    ]);
    setEditingForm({ isNew: true });
  };

  const handleStartEdit = (f) => {
    setTitle(f.title);
    setSlug(f.slug);
    setDescription(f.description || '');
    setSubmitButtonText(f.submitButtonText || 'Submit Request');
    setSuccessMessage(f.successMessage || 'Thank you! We have received your inquiry.');
    setRedirectUrl(f.redirectUrl || '');
    setNotifyEmail(f.notifyEmail || '');
    setFields((f.fields || []).map((field, idx) => ({
      ...field,
      sortOrder: field.sortOrder ?? idx,
      options: Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')
    })));
    setEditingForm(f);
  };

  const handleAddField = () => {
    const newField = {
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'TEXT',
      placeholder: '',
      isRequired: false,
      sortOrder: fields.length,
      options: ''
    };
    setFields([...fields, newField]);
  };

  const handleFieldChange = (idx, key, value) => {
    setFields(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };
      return updated;
    });
  };

  const handleMoveField = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    setFields(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((f, i) => ({ ...f, sortOrder: i }));
    });
  };

  const handleRemoveField = (idx) => {
    setFields(prev => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, sortOrder: i })));
  };

  const handleSaveForm = async () => {
    if (!title.trim() || !slug.trim()) {
      alert('Please provide a form title and URL slug.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        description,
        submitButtonText,
        successMessage,
        redirectUrl: redirectUrl.trim() || null,
        notifyEmail: notifyEmail.trim() || null,
        fields: fields.map((f, i) => ({
          name: f.name || `field_${i}`,
          label: f.label || `Field ${i + 1}`,
          type: f.type || 'TEXT',
          placeholder: f.placeholder || '',
          isRequired: Boolean(f.isRequired),
          sortOrder: i,
          options: ['SELECT', 'RADIO', 'CHECKBOX'].includes(f.type)
            ? (typeof f.options === 'string' ? f.options.split(',').map(s => s.trim()).filter(Boolean) : f.options)
            : []
        }))
      };

      if (editingForm.isNew) {
        const res = await createForm(payload);
        if (res.success) {
          alert('Form created successfully!');
          setEditingForm(null);
          loadForms();
        }
      } else {
        const res = await updateForm(editingForm.id, payload);
        if (res.success) {
          alert('Form updated successfully!');
          setEditingForm(null);
          loadForms();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForm = async (id, formTitle) => {
    if (!window.confirm(`Are you sure you want to delete form "${formTitle}"? Associated submissions will be preserved in unified leads.`)) {
      return;
    }
    try {
      const res = await deleteForm(id);
      if (res.success) {
        setForms(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete form');
    }
  };

  const handleCopySlug = (formSlug) => {
    navigator.clipboard.writeText(formSlug);
    setCopiedSlug(formSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Form Builder & Lead Engines</h1>
          <p className="text-sm text-neutral-400">
            Create custom lead capture forms, configure validation rules, and connect them to Page Builder blocks.
          </p>
        </div>

        {!editingForm && (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold rounded-lg shadow-sm transition"
          >
            <Plus size={16} />
            <span>Create New Form</span>
          </button>
        )}
      </div>

      {/* Mode 1: Forms List */}
      {!editingForm ? (
        loading ? (
          <div className="py-24 text-center text-neutral-500">Loading forms...</div>
        ) : forms.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-800 rounded-xl">
            <Layers className="mx-auto text-neutral-600 mb-3" size={40} />
            <h3 className="text-white font-medium">No custom forms created yet</h3>
            <p className="text-sm text-neutral-500 mt-1">Build forms with custom fields, validation, and auto-UTM tracking.</p>
            <button
              onClick={handleStartCreate}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
            >
              Build Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map(form => (
              <div
                key={form.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{form.title}</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {form.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      <span className="text-white font-semibold">{form.fields?.length || 0}</span> fields
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">{form.submissionCount || form._count?.submissions || 0}</span> submissions
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 bg-neutral-950 border border-neutral-800/80 rounded px-2.5 py-1 text-[11px] text-neutral-400">
                    <span className="text-neutral-500">Slug:</span>
                    <span className="font-mono text-white truncate flex-1">{form.slug}</span>
                    <button
                      onClick={() => handleCopySlug(form.slug)}
                      className="p-1 hover:text-white"
                      title="Copy Slug for Page Builder"
                    >
                      {copiedSlug === form.slug ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleStartEdit(form)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition"
                  >
                    <Edit size={13} />
                    <span>Edit Form</span>
                  </button>

                  <button
                    onClick={() => handleDeleteForm(form.id, form.title)}
                    className="p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                    title="Delete Form"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Mode 2: Form Editor & Field Builder */
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingForm.isNew ? 'Create New Form' : `Edit: ${editingForm.title}`}
              </h2>
              <p className="text-xs text-neutral-400">
                Configure form destination, messages, and custom dynamic input fields.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingForm(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={saving}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>

          {/* Form Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Form Name</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Free Growth Strategy Audit"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Slug (Identifier)</label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. growth-audit-form"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Description (Internal or Subtitle)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description displayed above form fields"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Submit Button Label</label>
              <input
                type="text"
                value={submitButtonText}
                onChange={e => setSubmitButtonText(e.target.value)}
                placeholder="Submit Request"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Notification Email</label>
              <input
                type="email"
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                placeholder="admin@digitalclik.com (optional)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Success Message</label>
              <input
                type="text"
                value={successMessage}
                onChange={e => setSuccessMessage(e.target.value)}
                placeholder="Thank you! We will get back to you shortly."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Fields Builder */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Form Fields ({fields.length})</h3>
                <p className="text-xs text-neutral-400">Define the input fields visitors will fill out.</p>
              </div>

              <button
                onClick={handleAddField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition"
              >
                <Plus size={14} />
                <span>Add Field</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                No fields added yet. Click &quot;Add Field&quot; to begin building your form.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveField(idx, -1)}
                          disabled={idx === 0}
                          className="text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveField(idx, 1)}
                          disabled={idx === fields.length - 1}
                          className="text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-mono text-neutral-500">#{idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1 w-full">
                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Field Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white"
                          placeholder="e.g. Budget"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Field Name (Key)</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-white"
                          placeholder="e.g. budget"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Input Type</label>
                        <select
                          value={field.type}
                          onChange={e => handleFieldChange(idx, 'type', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white"
                        >
                          <option value="TEXT">Single-line Text</option>
                          <option value="EMAIL">Email Address</option>
                          <option value="PHONE">Phone Number</option>
                          <option value="TEXTAREA">Multi-line Textarea</option>
                          <option value="SELECT">Dropdown (Select)</option>
                          <option value="RADIO">Radio Buttons</option>
                          <option value="CHECKBOX">Checkbox</option>
                          <option value="NUMBER">Number</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Placeholder</label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={e => handleFieldChange(idx, 'placeholder', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white"
                          placeholder="Optional placeholder"
                        />
                      </div>
                    </div>

                    {['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type) && (
                      <div className="w-full md:w-auto md:min-w-[200px]">
                        <label className="text-[10px] text-neutral-500 block uppercase">Options (comma-separated)</label>
                        <input
                          type="text"
                          value={field.options || ''}
                          onChange={e => handleFieldChange(idx, 'options', e.target.value)}
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={e => handleFieldChange(idx, 'isRequired', e.target.checked)}
                          className="rounded border-neutral-700"
                        />
                        <span>Required</span>
                      </label>

                      <button
                        onClick={() => handleRemoveField(idx)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Delete Field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

