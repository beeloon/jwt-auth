import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { FC } from 'react';
import { Context } from '.';
import LoginForm from './components/LoginForm';
import { IUser } from './models/IUser';
import UserService from './services/UserService';

const App: FC = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);

  async function getUsers() {
    try {
      const response = await UserService.fetchUsers();

      setUsers(response.data);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, [store]);

  if (store.isLoading) {
    return <div>Loading...</div>;
  }

  if (!store.isAuth) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>
        {store.isAuth
          ? `User authenticated with mail ${store.user.email}`
          : 'Signup or Login'}
      </h1>
      <h1>
        {store.user.isActivated
          ? 'Account is activated by mail'
          : 'Activate your account!'}
      </h1>
      <button onClick={() => store.logout()}>Logout</button>
      <button onClick={getUsers}>Get users</button>
      {users.map((user) => (
        <div key={user.email}>{user.email}</div>
      ))}
    </div>
  );
};

export default observer(App);
