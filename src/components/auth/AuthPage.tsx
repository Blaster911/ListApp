import { useState } from 'react';
import { BedDouble } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <BedDouble className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inventaire Airbnb - Gérez facilement vos biens
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLogin ? (
            <LoginForm
              onSuccess={() => {}}
              onRegisterClick={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={() => setIsLogin(true)}
              onLoginClick={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}