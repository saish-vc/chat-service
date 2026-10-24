import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import { FormField } from "./FormField";

export default function ProfilePanel() {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "#6366f1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim(), avatarColor });
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <Avatar username={user?.username} color={user?.avatarColor} size={28} />
        <span className="text-sm font-medium">{user?.displayName || user?.username}</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && (
            <div className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <FormField label="Display name" required>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others see you"
            />
          </FormField>
          <FormField label="Avatar color">
            <AvatarPicker value={avatarColor} onChange={setAvatarColor} />
          </FormField>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            <Avatar username={displayName || user?.username} color={avatarColor} size={48} />
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {displayName || user?.username}
              </div>
              <div className="text-xs text-[var(--text-muted)]">{user?.username}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
