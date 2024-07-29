import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { PrismaClient, type User } from "@prisma/client";
import { addDays, dateDiffInDays, FormatMoney } from "../utils";

const prisma = new PrismaClient();
const client = new Client({
  authStrategy: new LocalAuth(),
});

class BotController {

  constructor() {
    this.initialize();
  }

  async initialize() {
    this.setupClient();
  }

  //* Get || Users Data
  async loadData() {
    try {
      const users = await prisma.user.findMany();
      return users
    } catch (err) {
      console.error("Error loading phones:", err);
    }
  }

  // * Update || Set User Pay to True
  async setUserPay(phone: string) {
    try {
      const data = await this.loadData();
      const getPayUserInfo = data?.find(item => item.phone === phone);

      const today = new Date().toISOString();
      const nextPayDay = addDays(new Date(), 20).toISOString()
      
      if(!getPayUserInfo?.Pay){
      await prisma.user.updateMany({
          where: {
            phone: {
              equals: phone,
            },
          },
          data: {
            Pay: {
              set: true,
            },
            payDate: {
              set: today
            },
            nextPayDate: {
              set: nextPayDay
            }
          },
        });

          return `*Parabéns!!* *${getPayUserInfo?.name}* pagou _${FormatMoney(getPayUserInfo?.value.toString() ?? "0")}_ e agora não corre mais risco de vida.`
        }

        return `Rlx *${getPayUserInfo?.name}* você já pagou!!`
    } catch (err) {
      console.error("Error loading phones:", err);
      return "Ocorreu Um Erro Inesperado"
    }
  }

  // * User Info || Specific User 
  async getUserByPhone(phone : string){
    try{
      const userPhone = await prisma.user.findFirst({
        where: {
          phone: {
            equals : phone
          }
        },
        
      });

      const message = `*${userPhone?.id}* - Nome: *${userPhone?.name}* - Valor: _${FormatMoney(userPhone?.value.toString() ?? "0")}_ - Pago : *${userPhone?.Pay ? "Sim" : "Não"}* - Proximo Dia Pagamento : *${userPhone?.nextPayDate?.toLocaleDateString("en-GB") ?? ""}*
      `
      return message
    }catch(err){
      console.log(err)
      return "Ocorreu Um Erro Inesperado"
    }
  }

  // * Time 
  async getTime(phone : string){
    try{
      const userPhone = await prisma.user.findFirst({
        where: {
          phone: {
            equals : phone
          }
        },
        
      });
      const nextPayDate = userPhone?.nextPayDate ? new Date(userPhone.nextPayDate) : new Date();
      const payDate = userPhone?.payDate ? new Date(userPhone.payDate) : new Date();

      const diffInDays = dateDiffInDays(payDate, nextPayDate);

      // console.log("Date Diff: ", diffInDays);
      return `Falta ainda ${diffInDays} dias para a proxima cobranca.`
    }catch(err){
      console.log(err)
      return "Ocorreu Um Erro Inesperado"
    }
  }

  //* Teste 
  async createUser(chat:WAWebJS.Chat){
    let user : Partial<User> = {};
    let step = 1;
    await chat.sendMessage(`> Modo de Criação de Usuário, são necessárias as seguintes informações para criar um novo usuário no nosso sistema 
      *Nome, Valor (Valor da Cobrança) e Numero de Telefone (Opcional: Informar se o valor já foi pago)*`)

    await chat.sendMessage("> Pra Sair Do Modo De Criacao e so digitar /Exit");
    await chat.sendMessage("*Nome:*");

    user.name = chat.lastMessage.body ?? ""
    console.log(user);
  }

  setupClient() {
    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("QR Code generated, scan it with your phone.");
    });

    client.on("message_create", async (message) => {
      try {
        console.log("Message body:", message.body);
        const contact = await message.getContact();
        const usersData = await this.loadData();
        const userPhones = usersData?.map((item) => item.phone)
        const chat = await message.getChat();
        let bolUser: boolean = false;
        // console.log(contact);

        // * Pay
        if (message.body === "/Pay" && userPhones?.includes(contact.number)) {
          const payMessage = await this.setUserPay(contact.number);
          await message.reply(payMessage);
        }
        
        // * Info
        if (message.body === "/Info" && userPhones?.includes(contact.number)) {
          const infoMessage = await this.getUserByPhone(contact.number);
          await message.reply(infoMessage);
        }

        // * Time until new payment
        if (message.body === "/Time" && userPhones?.includes(contact.number)) {
          const timeMessage = await this.getTime(contact.number);
          await message.reply(timeMessage);
        }
        
        // * Payment Way Info

        // * Cron Week Verify

        // * Add User 
        if (message.body === "/Create" && userPhones?.includes(contact.number)) {
         bolUser = true;
        }

        if(bolUser){
          await this.createUser(chat);
          bolUser = false;
        }
        // * Add Payment Info

      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    client.initialize();
  }
}

export const botController = new BotController();
