import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section>
            <header>
                <h3 className="card-title">Delete Account</h3>
                <p style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Once your account is deleted, all of its resources and data will be
                    permanently deleted. Before deleting your account, please download any
                    data or information that you wish to retain.
                </p>
            </header>

            <div style={{ marginTop: 16 }}>
                <DangerButton onClick={confirmUserDeletion}>Delete Account</DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h3 className="card-title">Are you sure you want to delete your account?</h3>

                    <p style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>
                        Once your account is deleted, all of its resources and data will be
                        permanently deleted. Please enter your password to confirm you would
                        like to permanently delete your account.
                    </p>

                    <div className="form-group" style={{ marginTop: 20 }}>
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            isFocused
                            placeholder="Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

                        <DangerButton disabled={processing}>Delete Account</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
