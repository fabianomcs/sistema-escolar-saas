// FUNÇÕES DE MÁSCARA E VALIDAÇÃO

// 1. Aplica máscara de CPF: 000.000.000-00
export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é número
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1') // Impede digitar mais que o necessário
}

// 2. Aplica máscara de Celular: (00) 00000-0000
export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

// 3. Aplica máscara de Moeda: R$ 0,00
export const maskCurrency = (value: string) => {
  const numericValue = value.replace(/\D/g, '')
  const floatValue = Number(numericValue) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(floatValue)
}

// 4. Validação Matemática de CPF (Algoritmo Oficial)
export const validarCPF = (cpf: string): boolean => {
  const strCPF = cpf.replace(/[^\d]+/g, '')
  if (strCPF.length !== 11 || /^(\d)\1+$/.test(strCPF)) return false
  
  let soma = 0
  let resto
  
  for (let i = 1; i <= 9; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
  
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(strCPF.substring(9, 10))) return false
  
  soma = 0
  for (let i = 1; i <= 10; i++) 
    soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
  
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(strCPF.substring(10, 11))) return false
  
  return true
}

// 5. Gerador de Senha Inicial
export const gerarSenhaInicial = (nome: string, cpf: string) => {
  const primeiroNome = nome.split(' ')[0].toLowerCase()
  const ultimosDigitos = cpf.replace(/\D/g, '').slice(-4)
  return `${primeiroNome}@${ultimosDigitos}` // Ex: fabiano@8899
}