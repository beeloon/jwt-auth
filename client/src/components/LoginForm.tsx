import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { useState, FC } from 'react';
import { Context } from '..';

const LoginForm: FC = () => {
  const [email, setEmeil] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { store } = useContext(Context);

  return (
    <div>
      <input
        onChange={(e) => setEmeil(e.target.value)}
        type="text"
        value={email}
        placeholder="Email"
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
        placeholder="Password"
      />
      <button onClick={() => store.login(email, password)}>Login</button>
      <button onClick={() => store.registration(email, password)}>
        Signup
      </button>
    </div>
  );
};

export default observer(LoginForm);
