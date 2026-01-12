import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { DashboardClient } from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const history = await prisma.jobGroup.findMany({
        where: { userId: session.user.id },
        include: { jobs: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return <DashboardClient initialHistory={history} />;
}
