import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './shared/store';
import { useAuth } from './auth/hooks/useAuth';
import { openGoogleLoginPopup } from "./auth/login";
import "./assets/home.css"

function AppContent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    refreshUser
  } = useAuth();

  useEffect(() => {

    if (!isLoading && !isAuthenticated && !error) {
      console.log('🔄 Checking auth status...');
      refreshUser();
    }

    if (!isLoading && !user && !error) {
      refreshUser();
    }

  }, [isLoading, user, error, refreshUser]);

  if (isLoading) {
    return <div>Зареждане...</div>;
  }



  // Ако има грешка (401) И няма потребител -> Показваме Login
  if ((!isAuthenticated && !user) || error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Добре дошли</h1>
        <p>Моля, влезте в системата.</p>
        <button onClick={openGoogleLoginPopup}>Login with Google</button>
        {error && <p style={{ color: 'red' }}>Грешка: {error.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Здравей, {user?.name}!</h1>
      <button onClick={logout}>Изход</button>
    </div>
  );
}



function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;