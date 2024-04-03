# Year-end and dividend journal entries

On the last day of a given fiscal year, two journal entries need to be created:

- **Skatt på årets resultat** Move 2510 to 8910 (Skatt som belastar årets resultat). This assumes you've calculated the corporate tax, 
  which is often done together with the annual report.
- **Årets resultat** Move 2099 to 8999.

On the first day of the next fiscal year:

- **Vinst eller förlust från föregående år** Move 2098 (Vinst eller förlust från föregående år) to 2099.

After the "annual meeting":

- **Resultatdisposition** Move 2091 to 2098. If dividend is to be paid, move that amount from 2091 to
  2898 (Outtagen vinstutdelning) instead.
- **Utbetalning av utdelning** Move 1930 to 2898.

https://www.arsredovisning-online.se/artiklar/bokfora-skatt-och-arets-resultat/
