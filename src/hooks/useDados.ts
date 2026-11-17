import { useEffect, useState } from 'react';
import { buscar } from '../services/api';

export type Estado<T> = { tipo: 'carregando' } | { tipo: 'erro' } | { tipo: 'ok'; dados: T };

export function useDados<T>(caminho: string): Estado<T> {
  const [estado, setEstado] = useState<Estado<T>>({ tipo: 'carregando' });

  useEffect(() => {
    let ignorar = false;
    buscar<T>(caminho)
      .then((dados) => {
        if (!ignorar) setEstado({ tipo: 'ok', dados });
      })
      .catch(() => {
        if (!ignorar) setEstado({ tipo: 'erro' });
      });
    return () => {
      ignorar = true;
    };
  }, [caminho]);

  return estado;
}
