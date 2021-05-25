import { GetStaticProps } from 'next';
import { format,parseISO } from 'date-fns';
import Image from 'next/image';

import { api } from '../services/api';
import  ptBR  from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss'

type Episodes = {
  id: string;
  title: string;
  thumbnail: string
  members: string;
  publishedAt: string;
  duration: string;
  durationAsString: string;
  url: string;
  description: string;  
}

type HomeProps ={
  allEpisodes: Episodes[]
  latestEpisodes: Episodes[]
}

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  return (
    <div className={styles.homepage} >
      <section className={styles.latestEpisodes}>
        <h1>Ultimos lançamentos</h1>
          <ul>
            {
              latestEpisodes.map(episode => {
                return(
                  <li key={episode.id} >
                    <Image 
                      width={192} 
                      height={192}  
                      src={episode.thumbnail} 
                      alt={episode.title} 
                      objectFit="cover" 
                    />

                    <div className={styles.episodeDetails}>
                      <a href="">{episode.title}</a>
                      <p>{episode.members}</p>
                      <span>{episode.publishedAt}</span>
                      <span>{episode.durationAsString}</span>
                    </div>

                    <button type='button'>
                      <img src="/play-green.svg" alt='Tocar episódio'/>
                    </button>
                  </li>
                )
              }) 
            }
          </ul>
      </section>
      <section className={styles.allEpisodes} >
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
           <thead>
             <th></th>
             <th>Podcast</th>
             <th>Integrantes</th>
             <th>Data</th>
             <th>Duração</th>
             <th></th>
           </thead>
           <tbody>
             {allEpisodes.map(episode => {
               return (
                 <tr key={episode.id} >
                   <td>
                     <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                     />
                   </td>
                   <td>
                     <a href="" > {episode.title} </a>
                   </td>
                   <td>{episode.members}</td>
                   <td>{episode.publishedAt}</td>
                   <td>{episode.durationAsString}</td>
                   <td>
                     <button type='button'>
                        <img src="/play-green.svg" alt="Tocar episódio" />
                     </button>
                   </td>
                 </tr>
               )
             })}
           </tbody>
        </table>      
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const { data } = await api.get('episodes' , {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const updateTime = (60 * 60) * 8
  const episodes = data.map(episodes => {
    return {
      id: episodes.id,
      title: episodes.title,
      thumbnail: episodes.thumbnail,
      members: episodes.members,
      publishedAt: format(parseISO(episodes.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episodes.file.duration),
      durationAsString: convertDurationToTimeString(Number(episodes.file.duration)),
      description: episodes.description,
      url: episodes.file.url,

    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length)

  return {
    props:{
      allEpisodes,
      latestEpisodes
    },
    revalidate: updateTime 
  }
}