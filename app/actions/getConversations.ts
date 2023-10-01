import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc', // sắp xếp để các tin nhắn mới nhất
      },
      where: {
        userIds: {
          has: currentUser.id // các cuộc hội thoại có chứa current id ==> nó sẽ bao gồm cả cuộc trò chuyện nhóm + group
        }
      },
      include: {
        users: true, // lấy tất cả các thôn tin của users
        messages: {
          include: { // lấy tất cả các thôn tin của messages
            sender: true,
            seen: true,
          }
        },
      }
    });

    return conversations;
  } catch (error: any) {
    return [];
  }
};

export default getConversations;