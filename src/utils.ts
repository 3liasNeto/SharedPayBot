export const FormatMoney = (money : string) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(money))
}

export function addDays(date : Date, days : number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

export function dateDiffInDays(date1 : Date, date2 : Date) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
    return Math.floor((utc2 - utc1) / msPerDay);
  }  