export default function DisciplinaHome({params,}:{params: {slug:string};}) {
    return (
        <h1 className="text-2xl font-semibold">
            Página da disciplina: {params.slug.toUpperCase()}
        </h1>
    )
};