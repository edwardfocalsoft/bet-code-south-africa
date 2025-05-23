
// South African Banks with their branch codes
export type BankOption = {
  name: string;
  code: string;
};

export const southAfricanBanks: BankOption[] = [
  { name: "ABSA Bank", code: "632005" },
  { name: "Capitec Bank", code: "470010" },
  { name: "First National Bank", code: "250655" },
  { name: "Nedbank", code: "198765" },
  { name: "Standard Bank", code: "051001" },
  { name: "African Bank", code: "430000" },
  { name: "Bidvest Bank", code: "462005" },
  { name: "Discovery Bank", code: "679000" },
  { name: "TymeBank", code: "678910" },
  { name: "Investec", code: "580105" },
  { name: "Sasfin Bank", code: "683000" },
  { name: "Mercantile Bank", code: "450105" },
  { name: "Ubank", code: "431010" },
  { name: "Bank Zero", code: "888000" },
];

export const findBankByName = (bankName: string): BankOption | undefined => {
  return southAfricanBanks.find(bank => bank.name === bankName);
};
