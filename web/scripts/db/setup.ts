import { migrate } from 'drizzle-orm/postgres-js/migrator'
import db from '../../src/db'
import { Accounts } from '../../src/schema'
import { sql } from 'drizzle-orm'

// these values are largely based on https://www.bas.se/wp-content/uploads/2022/01/Kontoplan-2022.pdf

async function main() {
  await migrate(db, { migrationsFolder: 'drizzle' })

  await db
    .insert(Accounts)
    .values([
      {
        id: 1510,
        description: 'Kundfordringar',
      },
      {
        id: 1630,
        description: 'Skattekonto',
      },
      {
        id: 1650,
        description: 'Momsfordran',
      },
      {
        id: 1790,
        description: 'Övriga förutbetalda kostnader och upplupna intäkter',
      },
      {
        id: 1930,
        description: 'Företagskonto',
      },
      {
        id: 1931,
        description: 'Företagskonto (spar)',
      },
      {
        id: 1932,
        description: 'Företagskonto (inaktiv)',
      },
      {
        id: 2081,
        description: 'Aktiekapital',
      },
      {
        id: 2091,
        description: 'Balanserad vinst eller förlust',
      },
      {
        id: 2098,
        description: 'Vinst eller förlust från föregående år',
      },
      {
        id: 2099,
        description: 'Årets resultat',
      },
      {
        id: 2510,
        description: 'Skatteskulder',
      },
      {
        id: 2512,
        description: 'Beräknad inkomstskatt',
      },
      {
        id: 2518,
        description: 'Betald preliminärskatt',
      },
      {
        id: 2610,
        description: 'Utgående moms 25%',
      },
      {
        id: 2614,
        description: 'Utgående moms omvänd skattskyldighet 25%',
      },
      {
        id: 2640,
        description: 'Ingående moms',
      },
      {
        id: 2645,
        description: 'Beräknad ingående moms på förvärv från utlandet',
      },
      {
        id: 2650,
        description: 'Redovisningskonto för moms',
      },
      {
        id: 2710,
        description: 'Personalskatt',
      },
      {
        id: 2731,
        description: 'Avräkning lagstadgade sociala avgifter',
      },
      {
        id: 2890,
        description: 'Övriga kortfristiga skulder',
      },
      {
        id: 2990,
        description: 'Övriga upplupna kostnader och förutbetalda intäkter',
      },
      {
        id: 3011,
        description: 'Försäljning tjänster inom Sverige 25% moms',
      },
      {
        id: 3071,
        description: 'Förutbetalda intäkter, varor och tjänster',
      },
      {
        id: 3740,
        description: 'Öres- och kronutjämning',
      },
      {
        id: 4010,
        description: 'Inköp material och varor',
      },
      {
        id: 4531,
        description: 'Import tjänster land utanför EU 25% moms',
      },
      {
        id: 4535,
        description: 'Inköp av tjänster från annat EU-land 25%',
      },
      {
        id: 5410,
        description: 'Förbrukningsinventarier',
      },
      {
        id: 5810,
        description: 'Biljetter',
      },
      {
        id: 5831,
        description: 'Kost och logi i Sverige',
      },
      {
        id: 5832,
        description: 'Kost och logi i utlandet',
      },
      {
        id: 6000,
        description: 'Övriga försäljningskostnader (gruppkonto)',
      },
      {
        id: 6212,
        description: 'Mobiltelefon',
      },
      {
        id: 6230,
        description: 'Datakommunikation',
      },
      {
        id: 6310,
        description: 'Företagsförsäkringar',
      },
      {
        id: 6550,
        description: 'Konsultarvoden',
      },
      {
        id: 6570,
        description: 'Bankkostnader',
      },
      {
        id: 6991,
        description: 'Övriga externa kostnader, avdragsgilla',
      },
      {
        id: 6992,
        description: 'Övriga externa kostnader, ej avdragsgilla',
      },
      {
        id: 7210,
        description: 'Löner till tjänstemän',
      },
      {
        id: 7510,
        description: 'Arbetsgivaravgifter',
      },
      {
        id: 7699,
        description: 'Övriga personalkostnader',
      },
      {
        id: 8314,
        description: 'Skattefria ränteintäkter',
      },
      {
        id: 8423,
        description: 'Räntekostnader för skatter och avgifter',
      },
      {
        id: 8910,
        description: 'Skatt som belastar årets resultat',
      },
      {
        id: 8999,
        description: 'Årets resultat',
      },
    ])
    .onConflictDoUpdate({
      target: Accounts.id,
      // https://stackoverflow.com/a/36930792
      set: { description: sql`excluded.description` },
    })

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
