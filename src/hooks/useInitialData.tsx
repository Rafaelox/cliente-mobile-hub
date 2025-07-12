import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInitialData = () => {
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Verificar se já existem dados
      const { data: consultors, error: consultorsError } = await supabase
        .from('consultores')
        .select('id')
        .limit(1);

      if (consultorsError) throw consultorsError;

      // Se não há consultores, criar dados iniciais
      if (!consultors || consultors.length === 0) {
        await createInitialData();
      }
    } catch (error: any) {
      console.error('Erro ao verificar dados iniciais:', error);
    }
  };

  const createInitialData = async () => {
    try {
      // Criar consultores
      const { data: consultorsData, error: consultorsError } = await supabase
        .from('consultores')
        .insert([
          {
            nome: 'Dr. João Silva',
            email: 'joao@exemplo.com',
            telefone: '(11) 99999-1111',
            percentual_comissao: 15.0,
            ativo: true
          },
          {
            nome: 'Dra. Ana Costa',
            email: 'ana@exemplo.com',
            telefone: '(11) 99999-2222',
            percentual_comissao: 20.0,
            ativo: true
          }
        ])
        .select();

      if (consultorsError) throw consultorsError;

      // Criar serviços
      const { error: servicosError } = await supabase
        .from('servicos')
        .insert([
          {
            nome: 'Consulta Geral',
            descricao: 'Consulta médica geral',
            preco: 150.0,
            duracao_minutos: 60,
            ativo: true
          },
          {
            nome: 'Consulta Especializada',
            descricao: 'Consulta com especialista',
            preco: 250.0,
            duracao_minutos: 90,
            ativo: true
          },
          {
            nome: 'Retorno',
            descricao: 'Consulta de retorno',
            preco: 100.0,
            duracao_minutos: 30,
            ativo: true
          }
        ]);

      if (servicosError) throw servicosError;

      // Criar formas de pagamento
      const { error: formasError } = await supabase
        .from('formas_pagamento')
        .insert([
          {
            nome: 'Dinheiro',
            descricao: 'Pagamento em dinheiro',
            ordem: 1,
            ativo: true
          },
          {
            nome: 'PIX',
            descricao: 'Pagamento via PIX',
            ordem: 2,
            ativo: true
          },
          {
            nome: 'Cartão de Crédito',
            descricao: 'Pagamento com cartão de crédito',
            ordem: 3,
            ativo: true
          },
          {
            nome: 'Cartão de Débito',
            descricao: 'Pagamento com cartão de débito',
            ordem: 4,
            ativo: true
          }
        ]);

      if (formasError) throw formasError;

      // Criar categorias
      const { error: categoriasError } = await supabase
        .from('categorias')
        .insert([
          {
            nome: 'Cliente Regular',
            descricao: 'Cliente com atendimento regular',
            ativo: true
          },
          {
            nome: 'Cliente VIP',
            descricao: 'Cliente com atendimento prioritário',
            ativo: true
          }
        ]);

      if (categoriasError) throw categoriasError;

      // Criar origens
      const { error: origensError } = await supabase
        .from('origens')
        .insert([
          {
            nome: 'Indicação',
            descricao: 'Cliente veio por indicação',
            ativo: true
          },
          {
            nome: 'Redes Sociais',
            descricao: 'Cliente veio pelas redes sociais',
            ativo: true
          },
          {
            nome: 'Site',
            descricao: 'Cliente veio pelo site',
            ativo: true
          }
        ]);

      if (origensError) throw origensError;

      toast({
        title: "Dados iniciais criados",
        description: "Sistema configurado com dados de exemplo",
      });

    } catch (error: any) {
      console.error('Erro ao criar dados iniciais:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados iniciais",
        variant: "destructive",
      });
    }
  };

  return { initializeData };
};