import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './shared/store';
import { useAuth } from './auth/hooks/useAuth';
import { openGoogleLoginPopup } from "./auth/login";

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
    // ЛОГИКА ЗА ПРЕДОТВРАТЯВАНЕ НА БЕЗКРАЕН ЦИКЪЛ:
    // 1. Ако вече се зарежда (isLoading === true) -> НЕ прави нищо (чакаме).
    // 2. Ако вече сме сигурни, че сме логнати (isAuthenticated === true) -> НЕ прави нищо.
    // 3. Ако вече сме сигурни, че НЕ сме логнати (isAuthenticated === false) -> НЕ прави нищо (сървърът вече каза 401).
    
    // Правим заявка САМО ако:
    // - Не се зарежда
    // - И все още не знаем статуса си (isAuthenticated е null/undefined или просто не е false след опит)
    // В нашия случай, най-сигурната проверка е:
    
    if (!isLoading && !isAuthenticated && !error) {
       // Важно: Проверяваме и дали user е null, но основният стопер е isAuthenticated === false
       // Ако isAuthenticated стане false веднъж, този блок няма да се изпълни отново.
       
       console.log('🔄 Checking auth status...');
       refreshUser();
    }
    
    // ЗАБЕЛЕЖКА: Ако твоят slice задава isAuthenticated = false при 401, 
    // горното условие (!isAuthenticated) ще е вярно и пак ще влезе в цикъл.
    
    // 🔥 ПО-СИГУРНАТА ЛОГИКА (Препоръчително):
    // Проверяваме дали изобщо сме правили опит. Можем да ползваме липсата на error + липсата на user.
    // Но най-добре е да разчитаме на това, че refreshUser() вече е бил викнат.
    
    // ЕТО НАЙ-ПРОСТИЯ ФИКС ЗА ТВОЯ СЛУЧАЙ:
    // Не пускай refreshUser, ако вече имаме грешка (401) И нямаме потребител.
    if (!isLoading && !user && !error) {
       refreshUser();
    }
    
    // ИЛИ ОЩЕ ПО-ДОБРЕ: Добави флаг в стейта "hasCheckedAuth". 
    // Но за бърз фикс, ето как да спреш цикъла с текущите данни:

  }, [isLoading, user, error, refreshUser]); 
  // ^^^ Махни isAuthenticated от зависимостите, за да не тригери пак при смяна на true/false

  // --- Рендеринг ---

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
        {error && <p style={{color: 'red'}}>Грешка: {error.message}</p>}
      </div>
    );
  }

  // Ако всичко е ОК -> Показваме приложението
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