import { migrate } from 'drizzle-orm/postgres-js/migrator'
import db from '../../src/db'
import { Accounts } from '../../src/schema'
import { sql } from 'drizzle-orm'

async function main() {
  await migrate(db, { migrationsFolder: 'drizzle' })

  await db
    .insert(Accounts)
    .values([
      {
        code: 1510,
        description: 'Kundfordringar',
      },
      {
        code: 1630,
        description: 'Skattekonto',
      },
      {
        code: 1650,
        description: 'Momsfordran',
      },
      {
        code: 1790,
        description: 'Övriga förutbetalda kostnader och upplupna intäkter',
      },
      {
        code: 1930,
        description: 'Företagskonto',
      },
      {
        code: 1932,
        description: 'Företagskonto (inaktiv)',
      },
      {
        code: 2081,
        description: 'Aktiekapital',
      },
      {
        code: 2091,
        description: 'Balanserad vinst eller förlust',
      },
      {
        code: 2098,
        description: 'Vinst eller förlust från föregående år',
      },
      {
        code: 2099,
        description: 'Årets resultat',
      },
      {
        code: 2510,
        description: 'Skatteskulder',
      },
      {
        code: 2610,
        description: 'Utgående moms 25%',
      },
      {
        code: 2614,
        description: 'Utgående moms omvänd skattskyldighet 25%',
      },
      {
        code: 2640,
        description: 'Ingående moms',
      },
      {
        code: 2645,
        description: 'Beräknad ingående moms på förvärv från utlandet',
      },
      {
        code: 2650,
        description: 'Redovisningskonto för moms',
      },
      {
        code: 2710,
        description: 'Personalskatt',
      },
      {
        code: 2731,
        description: 'Avräkning lagstadgade sociala avgifter',
      },
      {
        code: 2890,
        description: 'Övriga kortfristiga skulder',
      },
      {
        code: 2990,
        description: 'Övriga upplupna kostnader och förutbetalda intäkter',
      },
      {
        code: 3011,
        description: 'Försäljning tjänster inom Sverige 25% moms',
      },
      {
        code: 3071,
        description: 'Förutbetalda intäkter, varor och tjänster',
      },
      {
        code: 3740,
        description: 'Öres- och kronutjämning',
      },
      {
        code: 4010,
        description: 'Inköp material och varor',
      },
      {
        code: 4531,
        description: 'Import tjänster land utanför EU 25% moms',
      },
      {
        code: 4535,
        description: 'Inköp av tjänster från annat EU-land 25%',
      },
      {
        code: 5410,
        description: 'Förbrukningsinventarier',
      },
      {
        code: 5810,
        description: 'Biljetter',
      },
      {
        code: 5832,
        description: 'Kost och logi i utlandet',
      },
      {
        code: 6000,
        description: 'Övriga försäljningskostnader (gruppkonto)',
      },
      {
        code: 6212,
        description: 'Mobiltelefon',
      },
      {
        code: 6230,
        description: 'Datakommunikation',
      },
      {
        code: 6310,
        description: 'Företagsförsäkringar',
      },
      {
        code: 6550,
        description: 'Konsultarvoden',
      },
      {
        code: 6570,
        description: 'Bankkostnader',
      },
      {
        code: 6991,
        description: 'Övriga externa kostnader, avdragsgilla',
      },
      {
        code: 7210,
        description: 'Löner till tjänstemän',
      },
      {
        code: 7510,
        description: 'Arbetsgivaravgifter',
      },
      {
        code: 7699,
        description: 'Övriga personalkostnader',
      },
      {
        code: 8423,
        description: 'Räntekostnader för skatter och avgifter',
      },
      {
        code: 8910,
        description: 'Skatt som belastar årets resultat',
      },
      {
        code: 8999,
        description: 'Årets resultat',
      },
    ])
    .onConflictDoUpdate({
      target: Accounts.code,
      // https://stackoverflow.com/a/36930792
      set: { description: sql`excluded.description` },
    })

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
