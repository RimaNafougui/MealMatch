export default function RecettesPage() {
  return (
    <div className="flex flex-col gap-6 ">
      <div>
        <h1 className="text-2xl font-bold">Mes Recettes</h1>
        <p className="text-default-500 mt-1">
          Les recettes que vous avez sauvegardées.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-default-400 col-span-full text-center py-12">
          Vous n&apos;avez pas encore de recettes sauvegardées. Explorez pour en
          ajouter !
        </p>
      </div>
    </div>
  );
}
