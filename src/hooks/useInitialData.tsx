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
      const { data: servicosData, error: servicosError } = await supabase
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
        ])
        .select();

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

      // Criar clientes de exemplo
      const { data: clientsData, error: clientsError } = await supabase
        .from('clientes')
        .insert([
          {
            nome: 'Maria Santos',
            email: 'maria@exemplo.com',
            telefone: '(11) 98765-4321',
            cpf: '123.456.789-00',
            ativo: true
          },
          {
            nome: 'Pedro Oliveira',
            email: 'pedro@exemplo.com',
            telefone: '(11) 98765-1234',
            cpf: '987.654.321-00',
            ativo: true
          },
          {
            nome: 'Ana Silva',
            email: 'ana.silva@exemplo.com',
            telefone: '(11) 91234-5678',
            cpf: '456.789.123-00',
            ativo: true
          }
        ])
        .select();

      if (clientsError) throw clientsError;

      // Criar alguns agendamentos de exemplo se temos dados
      if (consultorsData && servicosData && clientsData) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await supabase.from('agenda').insert([
          {
            cliente_id: clientsData[0].id,
            consultor_id: consultorsData[0].id,
            servico_id: servicosData[0].id,
            data_agendamento: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
            valor_servico: servicosData[0].preco,
            comissao_consultor: servicosData[0].preco * (consultorsData[0].percentual_comissao / 100),
            status: 'agendado',
            observacoes: 'Primeira consulta'
          },
          {
            cliente_id: clientsData[1].id,
            consultor_id: consultorsData[1].id,
            servico_id: servicosData[1].id,
            data_agendamento: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30).toISOString(),
            valor_servico: servicosData[1].preco,
            comissao_consultor: servicosData[1].preco * (consultorsData[1].percentual_comissao / 100),
            status: 'confirmado',
            observacoes: 'Exame de rotina anual'
          }
        ]);
      }

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