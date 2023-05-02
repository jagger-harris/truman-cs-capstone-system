import type { Actions, ServerLoad } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { Prisma } from '@prisma/client'
import { fail } from "@sveltejs/kit";

// Server-side load function to fetch presentation data from the database
export const load: ServerLoad = async () => {
    try 
    {
        let prez = await prisma.$queryRaw(Prisma.sql`SELECT group_concat(IF(capstone_presentations.username="",1,0) separator ',') slot_taken, group_concat((id) separator ',') as id, group_concat(capstone_presentations.username separator ',') as username, DATE_FORMAT(time_start, '%m/%d/%Y') as date, group_concat(DATE_FORMAT(time_start, '%h:%i %p') separator ',') as time_start, group_concat(DATE_FORMAT(time_end, '%h:%i %p') separator ',') as time_end FROM capstone_presentations group by date order by date Asc;`)
        let prof_signup =  await prisma.$queryRaw(Prisma.sql`Select date_of_presentation, professor from professor_presentation_signup`)
        let lengths: number[] = []
        for(let count = 0; count < prez.length; count++) {
            prez[count].slot_taken = prez[count].slot_taken.split(',')
            prez[count].id = prez[count].id.split(',')
            prez[count].time_start = prez[count].time_start.split(',')
            prez[count].time_end = prez[count].time_end.split(',')
            prez[count].username = prez[count].username.split(',')
            console.log(prez[count].username)
            lengths.push(prez[count].time_start.length)
        }
        return{
            presentations: prez,
            table_size: Math.max(...lengths),
            prof_signup: prof_signup
        }
    } 
    catch (error) {
        console.error(error)
    }
}

// Actions that the webpage will perform that access the database
export const actions: Actions = { 
    
    Remove_Student: async ({ request }) => {
        const { username, presentation_id } = Object.fromEntries(await request.formData()) as { 
            username: string, 
            presentation_id: string
        }

        try{
            console.log(username)
            console.log(presentation_id)
            if(await prisma.$queryRaw(Prisma.sql`SELECT username FROM capstone_presentations WHERE username Like ${username}`)){
                await prisma.$queryRaw(Prisma.sql`Update capstone_presentations set username = "" where id = ${presentation_id}`)
            }
            
        } catch(err) {
            console.error(err)
            return fail(500, { message: 'Could not remove the presenter'})
        }

        return {
            status: 201
        }
    },

    Professor_Signup: async ({ request }) => {
        const { date, username } = Object.fromEntries(await request.formData()) as { 
            date: string, 
            username:string
        }
        try{
            if(await prisma.$queryRaw(Prisma.sql`SELECT professor FROM professor_presentation_signup WHERE professor Like ${username} AND date_of_presentation LIKE ${date}`)){
                await prisma.$queryRaw(Prisma.sql`Update professor_presentation_signup set professor = "" where professor = ${username}`)
            }
            await prisma.$queryRaw(Prisma.sql`INSERT INTO professor_presentation_signup(date_of_presentation, professor) values(${date},${username}})`)
        }
        catch(err) {
            console.error(err)
            return fail(500, { message: 'Could not remove the presenter'})
        }

        return {
            status: 201
        }
    }
}