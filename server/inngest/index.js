import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendMail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.delete({
            where: {
                id: data.id
            }
        })
    }
)

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
    { id: 'sync-workspace-from-clerk' },
    { event: "clerk/organization.created" },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url,
            }
        })

        // Add creator as ADMIN member
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN"
            }
        })
    }
)

// Inngest function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
    { id: "update-workspace-from-clerk" },
    { event: 'clerk/organization.updated' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
            }
        })
    }
)

// Inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
    { id: "delete-workspace-with-clerk" },
    { event: 'clerk/organization.deleted' },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.delete({
            where: {
                id: data.id
            }
        })
    }
)

// Inngest function to save workspace member data to a database
const syncWorkspaceMemberCreation = inngest.createFunction(
    { id: "sync-workspace-member-from-clerk" },
    { event: "clerk/organizationInvitation.accepted" },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,
                workspaceId: data.organization_id,
                role: String(data.role_name).toUpperCase()
            }
        })
    }
)

// Inngest function to send Email on Task Creation
const sendTaskAssignmentEmail = inngest.createFunction(
    { id: 'send-task-assignment-mail' },
    { event: "app/task.assigned" },
    async ({ event, step }) => {
        const { taskId, origin } = event.data

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: true, project: true }
        })

        await sendMail({
            to: task.assignee.email,
            subject: `New Task Assigned in ${task.project.name}`,
            body: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f7;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <div style="background: #4f46e5; padding: 20px; color: #fff; text-align: center;">
        <h2 style="margin: 0;">New Task Assigned</h2>
        <p style="margin: 0; font-size: 14px;">Project: ${task.project.name}</p>
      </div>

      <div style="padding: 25px;">
        <p style="font-size: 16px;">Hi <strong>${task.assignee.name}</strong>,</p>

        <p style="font-size: 15px;">
          You have been assigned a new task. Here are the details:
        </p>

        <div style="background: #f9fafb; padding: 15px 20px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Task Title:</strong> ${task.title}<br>
            <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}<br>
          </p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${origin}" 
             style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; font-size: 15px; border-radius: 6px; display: inline-block;">
            View Task
          </a>
        </div>

        <p style="font-size: 13px; color: #555;">
          If you have any questions, feel free to contact your project manager.
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Task Manager. All rights reserved.
      </div>

    </div>
  </div>
  `
        });

        if (new Date(task.due_date).toLocaleDateString() !== new Date.toDateString()) {
            await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));

            await step.run('check-if-task-is-completed', async () => {
                const task = await prisma.task.findUnique({
                    where: { id: taskId },
                    include: { assignee: true, project: true }
                })

                if (!task) {
                    return
                }

                if (task.status !== "DONE") {
                    await step.run('send-task-reminder-mail', async () => {
                        await sendMail({
                            to: task.assignee.email,
                            subject: `Reminder for ${task.project.name}`,
                            body: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f7;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <div style="background: #f97316; padding: 20px; color: #fff; text-align: center;">
        <h2 style="margin: 0;">Task Reminder</h2>
        <p style="margin: 0; font-size: 14px;">Project: ${task.project.name}</p>
      </div>

      <div style="padding: 25px;">
        <p style="font-size: 16px;">Hi <strong>${task.assignee.name}</strong>,</p>

        <p style="font-size: 15px;">
          This is a friendly reminder that the following task is pending and approaching its due date:
        </p>

        <div style="background: #fff7ed; padding: 15px 20px; border-left: 4px solid #f97316; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Task Title:</strong> ${task.title}<br>
            <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}<br>
          </p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${origin}" 
             style="background: #f97316; color: white; padding: 12px 20px; text-decoration: none; font-size: 15px; border-radius: 6px; display: inline-block;">
            View Task
          </a>
        </div>

        <p style="font-size: 13px; color: #555;">
          Please make sure to complete the task before the deadline.  
          If you need help, feel free to reach out.
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Task Manager. All rights reserved.
      </div>

    </div>
  </div>
  `
                        });

                    })
                }
            })
        }

    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
    sendTaskAssignmentEmail
];