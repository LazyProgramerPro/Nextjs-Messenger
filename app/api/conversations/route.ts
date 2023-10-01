import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorize", { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true, // lấy các thôn tin từ user
        },
      });

      return NextResponse.json(newConversation);
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId], // người dùng bằng người dùng hiện tại
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id], // người dùng bằng người dùng hiện tại
            },
          },
        ],
      },
    });

    // chỗ này sử dụng truy vấn đặc biệt nên sẽ ko dùng findOne => có thì trả về còn không thì tạo mới

    const singleConversation = existingConversations[0];

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true, // kết nối đến các user=> lấy thông tin user có trong cuộc hội thoại
      },
    });

    return  NextResponse.json(newConversation)
    
  } catch (error: any) {
    return new NextResponse("Internal Server", { status: 500 });
  }
}

///Để tọa 1 cuộc hội thoại nhóm thì phải check các ddk là group, đơn, số lượng, kết nối từ các members để lấy thông tin sau đó add cả người tạo vào nhóm
// Đối với cuộc trò chuyện nhóm thì chúng ta ko care đến trường hợp tạo trùng nhưng đối với trường hợp chat đơn thì phải check tồn tại hay chưa
